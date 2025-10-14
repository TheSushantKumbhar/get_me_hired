import os
from typing import Annotated, List, TypedDict
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from langgraph.graph import START, StateGraph
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage, SystemMessage
from llm.prompts import interview_prompt

load_dotenv()

llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
embeddings = OllamaEmbeddings(model="mxbai-embed-large")
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index = pc.Index(os.environ["INDEX_NAME"])
vector_store = PineconeVectorStore(embedding=embeddings, index=index)


class State(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    context: List[Document]
    languages: List[str]


def retrieve(state: State, languages: List[str] | None):
    """Retrieve relevant documents based on the last user message"""
    messages = state.get("messages", [])
    if not messages:
        return {"context": []}

    # some python magic code one line job done clown moment
    query = " ".join(
        str(msg.content) for msg in messages if isinstance(msg, HumanMessage)
    ).strip()

    if not query:
        return {"context": []}

    language_filter = {}
    if languages:
        language_filter["language"] = {"$in": languages}

    retrieved_docs = vector_store.similarity_search(
        query=query, k=3, filter=language_filter
    )
    return {"context": retrieved_docs}


def generate(state: State, languages: List[str] | None):
    """Generate interview response based on context and conversation history"""
    messages = state.get("messages", [])
    context_docs = state.get("context", [])

    if not messages:
        return {
            "messages": [AIMessage(content="Hello! I'm ready to start the interview.")]
        }

    # Format context from retrieved documents
    if context_docs:
        docs_content = "\n\n".join(doc.page_content for doc in context_docs)
    else:
        docs_content = (
            "No specific questions retrieved. Use your general interview knowledge."
        )

    # Create the system message with context
    system_message = SystemMessage(
        content=f"{interview_prompt}\n\n you are taking interview for the following languages: {languages}\n\nContext from knowledge base:\n{docs_content}"
    )

    # build the full message history: system message + all conversation history
    messages_for_llm = [system_message] + messages

    response = llm.invoke(messages_for_llm)
    return {"messages": [AIMessage(content=response.content)]}


def create_workflow(languages: list[str] | None = None):
    """Create the LangGraph workflow for the interview agent"""

    def retrieve_with_languages(state: State):
        if languages:
            state["languages"] = languages
        return retrieve(state, languages)

    def generate_with_languages(state: State):
        if languages:
            state["languages"] = languages
        return generate(state, languages)

    graph_builder = StateGraph(State)

    # Add nodes
    graph_builder.add_node("retrieve", retrieve_with_languages)
    graph_builder.add_node("generate", generate_with_languages)

    # Add edges
    graph_builder.add_edge(START, "retrieve")
    graph_builder.add_edge("retrieve", "generate")

    graph = graph_builder.compile()
    return graph


# i hope ts works bruh
if __name__ == "__main__":
    graph = create_workflow(languages=["go"])

    # Initialize state
    state: State = {"messages": [], "context": [], "languages": ["go"]}

    while True:
        user_input = input()
        if user_input == "/q":
            break

        state["messages"].append(HumanMessage(content=user_input))
        response = graph.invoke(state)
        # type casting this so my LSP does not cry ffs
        new_message = response["messages"][-1]

        state["messages"].append(new_message)
        state["context"] = response.get("context", state["context"])

        print("Candice: ", state["messages"][-1].content)
        print("\n\n")

    print("\n" + "=" * 50)
    print(f"\nTotal messages in history: {len(state['messages'])}")
