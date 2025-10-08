import os
from dotenv import load_dotenv

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import OllamaEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.runnables import RunnableConfig


from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.retrieval import create_retrieval_chain

from llm.prompts import interview_prompt, contextualize_q_system_prompt

load_dotenv()

LANGUAGE = "java"

if __name__ == "__main__":
    embeddings = OllamaEmbeddings(model="mxbai-embed-large")
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

    vector_store = PineconeVectorStore(
        index_name=os.environ["INDEX_NAME"], embedding=embeddings
    )
    retriever = vector_store.as_retriever(
        search_kwargs={
            "filter": {"language": LANGUAGE},
            "k": 3,
        }
    )

    # adjusts user query based on conversation history
    # if user say tell me about that, system understands what "that" is
    contextualize_q_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", contextualize_q_system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )
    history_aware_retriever = create_history_aware_retriever(
        llm, retriever, contextualize_q_prompt
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", interview_prompt),
            MessagesPlaceholder("chat_history"),
            ("user", "{input}"),
        ]
    )

    combine_docs_chain = create_stuff_documents_chain(llm, prompt)
    retrieval_chain = create_retrieval_chain(
        retriever=history_aware_retriever, combine_docs_chain=combine_docs_chain
    )

    # we are storing conversations in a dic hehe goofy word for a map in my opinion
    store = {}

    def get_session_history(session_id: str):
        if session_id not in store:
            store[session_id] = ChatMessageHistory()
        return store[session_id]

    conversational_interview_chain = RunnableWithMessageHistory(
        retrieval_chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
    )

    # each interview session getting different id for seperation purposes
    config = RunnableConfig(configurable={"session_id": "interview_001"})

    result = conversational_interview_chain.invoke(
        {"input": "lets get started"}, config=config
    )

    print(f"Candice: {result['answer']}\n")

    result2 = conversational_interview_chain.invoke(
        {"input": "umm sorry could you please come again?"}, config=config
    )
    print(f"Candice: {result2['answer']}\n")
