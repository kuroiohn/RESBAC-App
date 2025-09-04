import React from "react";

function sample() {
  useEffect(() => {
    // Log the imported variables to the console
    console.log("API Key:", REACT_APP_API_KEY);
    console.log("API URL:", REACT_APP_API_URL);
  }, []);
  return <div>sample</div>;
}

export default Sample;
