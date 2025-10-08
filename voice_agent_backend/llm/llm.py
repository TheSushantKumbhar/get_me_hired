import os
from dotenv import load_dotenv

from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import OllamaEmbeddings
from langchain_pinecone import PineconeVectorStore


from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain

from llm.prompts import interview_prompt

load_dotenv()

if __name__ == "__main__":
    embeddings = OllamaEmbeddings(model="mxbai-embed-large")

    vector_store = PineconeVectorStore(
        index_name=os.environ["INDEX_NAME"], embedding=embeddings
    )
    retriever = vector_store.as_retriever(
        search_kwargs={
            "filter": {"language": "java"},
            "k": 3,
        }
    )

    prompt = ChatPromptTemplate.from_messages(
        [("system", interview_prompt), ("user", "{input}")]
    )

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
    combine_docs_chain = create_stuff_documents_chain(llm, prompt)

    retrieval_chain = create_retrieval_chain(
        retriever=retriever, combine_docs_chain=combine_docs_chain
    )
    result = retrieval_chain.invoke({"input": "lets get started"})

    print(result)
