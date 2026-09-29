import "./App.css";
import EIP6963 from "./EIP6963.jsx";

function App() {
  return (
    <>
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <EIP6963 />
      </main>
    </>
  );
}

export default App;
