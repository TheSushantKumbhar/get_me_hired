from glob import glob
import os
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import MarkdownHeaderTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_pinecone import PineconeVectorStore

load_dotenv()

all_docs = []
headers_to_split = [("###", "question")]
md_paths = glob("../llm/data/mrkdown/*.md")

embeddings = OllamaEmbeddings(model="mxbai-embed-large")

print("loading markdown files")
for markdown_path in md_paths:
    lang_name = os.path.basename(markdown_path).lower().replace(".md", "")

    loader = TextLoader(markdown_path, encoding="utf-8")
    data = loader.load()

    markdown_content = data[0].page_content

    splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split)
    docs = splitter.split_text(markdown_content)

    for i, doc in enumerate(docs):
        doc.metadata["language"] = lang_name

        question = doc.metadata.pop("question", None)
        answer = doc.page_content

        doc.page_content = question
        doc.metadata["answer"] = answer

    # for testing delete later
    # for doc in docs:
    # print("language: ", doc.metadata["language"])
    # print("question: ", doc.page_content)
    # it works (hopefully)

    all_docs.append(docs)

# documents (markdown files) loaded
print("markdown files loaded!")
all_docs = [doc for sublist in all_docs for doc in sublist]
print(len(all_docs))

print("ingesting....")
PineconeVectorStore.from_documents(
    all_docs, embeddings, index_name=os.environ["INDEX_NAME"]
)
print("finished ingesting the documents....")
