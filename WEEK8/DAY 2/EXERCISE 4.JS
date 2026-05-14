const postData = async () => {
  const url = "YOUR_WEBHOOK_URL_HERE";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        key1: 'myusername',
        email: 'mymail@gmail.com',
        name: 'Isaac',
        lastname: 'Doe',
        age: 27
      })
    });
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error("Error posting data:", error);
  }
};

// Inside your component's return:
// <button onClick={postData}>Press me to post data</button>