from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import MarkdownHeaderTextSplitter

markdown_path = "../llm/data/mrkdown/JAVASCRIPT.md"
loader = TextLoader(markdown_path, encoding="utf-8")
data = loader.load()

markdown_content = data[0].page_content


headers_to_split = [("###", "question")]
splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split)
docs = splitter.split_text(markdown_content)

for i, doc in enumerate(docs):
    question = doc.metadata.pop("question", None)
    answer = doc.page_content

    doc.page_content = question
    doc.metadata["answer"] = answer

for doc in docs:
    print(doc.page_content)
