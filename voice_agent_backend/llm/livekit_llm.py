import os
from typing import Annotated, List, TypedDict
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import START, StateGraph
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, AIMessage
from llm.prompts import interview_prompt

load_dotenv()

llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
embeddings = OllamaEmbeddings(model="mxbai-embed-large")
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index = pc.Index(os.environ["INDEX_NAME"])
vector_store = PineconeVectorStore(embedding=embeddings, index=index)

prompt = ChatPromptTemplate([("system", interview_prompt), ("user", "{input}")])


# State compatible with LangChain's message format
class State(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    context: List[Document]


def retrieve(state: State):
    """Retrieve relevant documents based on the last user message"""
    messages = state.get("messages", [])
    if not messages:
        return {"context": []}

    # Get the last user message
    last_message = messages[-1]
    query = (
        last_message.content if hasattr(last_message, "content") else str(last_message)
    )

    if not query:
        return {"context": []}

    retrieved_docs = vector_store.similarity_search(query, k=3)
    return {"context": retrieved_docs}


def generate(state: State):
    """Generate interview response based on context and conversation history"""
    messages = state.get("messages", [])
    context_docs = state.get("context", [])

    if not messages:
        return {
            "messages": [AIMessage(content="Hello! I'm ready to start the interview.")]
        }

    # Get the last user message
    last_message = messages[-1]
    user_input = (
        last_message.content if hasattr(last_message, "content") else str(last_message)
    )

    # Format context from retrieved documents
    if context_docs:
        docs_content = "\n\n".join(doc.page_content for doc in context_docs)
    else:
        docs_content = (
            "No specific questions retrieved. Use your general interview knowledge."
        )

    # Invoke the prompt with input and context
    prompt_messages = prompt.invoke({"input": user_input, "context": docs_content})

    # Pass the full conversation history to maintain context
    response = llm.invoke(prompt_messages)

    # Return AI message
    return {"messages": [AIMessage(content=response.content)]}


def create_workflow():
    """Create the LangGraph workflow for the interview agent"""
    graph_builder = StateGraph(State)

    # Add nodes
    graph_builder.add_node("retrieve", retrieve)
    graph_builder.add_node("generate", generate)

    # Add edges
    graph_builder.add_edge(START, "retrieve")
    graph_builder.add_edge("retrieve", "generate")

    # Compile the graph
    graph = graph_builder.compile()
    return graph


# Test the workflow
if __name__ == "__main__":
    from langchain_core.messages import HumanMessage

    graph = create_workflow()
    init_state: State = {
        "messages": [HumanMessage(content="Hello, I'm ready for the interview")],
        "context": [],
    }
    response = graph.invoke(init_state)
    print("Interview Question:", response["messages"][-1].content)
