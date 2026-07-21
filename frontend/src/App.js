const uploadDocument = async (files) => {
  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", files[0]);

    const upload = await axios.post(
      "https://lexibrief-backend.onrender.com/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const id = upload.data.document_id;
    setDocId(id);


    const [summary, clauses, risks] = await Promise.all([
      axios.post(
        "https://lexibrief-backend.onrender.com/analyze",
        {
          doc_id: id,
          type: "summary",
        }
      ),

      axios.post(
        "https://lexibrief-backend.onrender.com/analyze",
        {
          doc_id: id,
          type: "clauses",
        }
      ),

      axios.post(
        "https://lexibrief-backend.onrender.com/analyze",
        {
          doc_id: id,
          type: "risks",
        }
      ),
    ]);


    setResults({
      summary: summary.data.result,
      clauses: clauses.data.result,
      risks: risks.data.result,
    });


  } catch (error) {

    console.log(error);
    alert("Document processing failed");

  } finally {

    setLoading(false);

  }
};