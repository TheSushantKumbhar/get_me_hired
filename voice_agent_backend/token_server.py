from flask import Flask, jsonify, request
from flask_cors import CORS
from livekit import api
import os
import time
import json
from dotenv import load_dotenv

from google import genai
import lizard

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/create-room", methods=["POST"])
def create_room_with_metadata():
    """Generate token with job metadata in participant metadata"""
    try:
        data = request.json
        participant_name = data.get("participant", "user")
        job_data = data.get("jobData", {})

        # Create unique room name
        room_name = f"interview-{participant_name}-{int(time.time())}"

        print(f"Creating token for room: {room_name}")
        print(f"Job data: {job_data}")

        # Create access token with metadata
        token = api.AccessToken(
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
        )

        # Add job data as participant metadata
        token.with_identity(participant_name).with_name(participant_name).with_metadata(
            json.dumps(job_data)
        ).with_grants(
            api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
            )
        )

        jwt_token = token.to_jwt()

        print(f"Token generated successfully for room: {room_name}")

        return jsonify(
            {
                "token": jwt_token,
                "url": os.getenv("LIVEKIT_URL"),
                "room_name": room_name,
            }
        )

    except Exception as e:
        print(f"Error in create_room_with_metadata: {e}")
        import traceback

        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/analyze", methods=["POST"])
def analyze_code():
    """Code analysis endpoint with Lizard + Gemini AI"""
    try:
        data = request.json
        code = data.get("code", "")
        language = data.get("language", "python")  # default to python

        # Determine file extension based on language
        file_extensions = {
            "python": ".py",
            "java": ".java",
            "javascript": ".js",
            "go": ".go",
        }
        file_ext = file_extensions.get(language.lower(), ".txt")
        filename = f"temp{file_ext}"

        # Analyze code complexity with Lizard
        analysis = lizard.analyze_file.analyze_source_code(filename, code)

        # Extract complexity metrics
        complexity_metrics = []
        for func in analysis.function_list:
            metrics = {
                "function_name": func.name,
                "cyclomatic_complexity": func.cyclomatic_complexity,
                "lines_of_code": func.nloc,
                "token_count": func.token_count,
                "parameter_count": func.parameter_count,
            }
            complexity_metrics.append(metrics)

        # If no functions detected, provide file-level metrics
        if not complexity_metrics:
            complexity_metrics = [
                {
                    "function_name": "N/A",
                    "cyclomatic_complexity": "No functions detected",
                    "lines_of_code": len(code.splitlines()),
                    "token_count": "N/A",
                    "parameter_count": "N/A",
                }
            ]

        # Format complexity data for Gemini prompt
        complexity_summary = "\n".join(
            [
                f"- Function: {m['function_name']}\n"
                f"  Cyclomatic Complexity: {m['cyclomatic_complexity']}\n"
                f"  Lines of Code: {m['lines_of_code']}\n"
                f"  Token Count: {m['token_count']}\n"
                f"  Parameters: {m['parameter_count']}"
                for m in complexity_metrics
            ]
        )

        prompt = f"""
As an expert code reviewer, analyze the following {language} code and provide a concise, point-wise summary with one overall rating at the top.

Code Complexity Metrics (from Lizard):
{complexity_summary}

Code to Review:
{code}

Please respond in the following HTML format:

<h1>Overall Rating (1-10): [rating]</h1>

<h2>Summary:</h2>
<p> [brief description of the code / algorithm] </p>
<ol>
<li><strong>Time Complexity:</strong> [brief analysis]</li>
<li><strong>Space Complexity:</strong> [brief analysis]</li>
<li><strong>Code Quality:</strong> [short notes on readability, maintainability, and best practices]</li>
<li><strong>Optimization Opportunities:</strong> [specific, actionable improvements; include concise before/after if relevant]</li>
<li><strong>Potential Bugs:</strong> [short, clear list of possible issues or edge cases]</li>
<li><strong>Cyclomatic Complexity:</strong> [interpretation of score and whether acceptable]</li>
</ol>

Instructions:
- Keep the response concise, structured, and directly answer the points above.
- Do not include explanations outside the specified fields.
- Use HTML tags exactly as shown for headings and list structure.
"""

        # Call Gemini API with enhanced prompt
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash", contents=prompt
        )

        return jsonify(
            {
                "status": "success",
                "complexity_metrics": complexity_metrics,
                "ai_analysis": response.text,
            }
        ), 200

    except Exception as e:
        print(f"Error in analyzing code: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Backend is running"})


if __name__ == "__main__":
    print("Starting Flask server...")
    print(f"LiveKit URL: {os.getenv('LIVEKIT_URL')}")
    app.run(host="0.0.0.0", port=5000, debug=True)
