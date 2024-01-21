export function combineDocuments(docs: {pageContent: string}[]){
    return docs.map((doc)=>doc.pageContent).join('\n\n')
}
