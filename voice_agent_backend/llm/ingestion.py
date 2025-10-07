from glob import glob
import os
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import MarkdownHeaderTextSplitter

all_docs = []
headers_to_split = [("###", "question")]
md_paths = glob("../llm/data/mrkdown/*.md")

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
    for doc in docs:
        if doc.metadata["language"] == "javascript":
            continue
        print("language: ", doc.metadata["language"])
        print("question: ", doc.page_content)
        print("------------------------------------------------")
    # it works (hopefully)

    all_docs.append(docs)

print(len(all_docs))
