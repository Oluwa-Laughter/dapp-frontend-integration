import { useState } from "react";
import "./App.css";
import ConnectButton from "./components/ConnectButton";
import RegistrationForm from "./components/RegistrationForm";
import StudentDetails from "./components/StudentDetails";
import StudentDirectory from "./components/StudentDirectory";
import useStudentDirectory from "./hooks/useStudentDirectory";
import useStudentRegistration from "./hooks/useStudentRegistration";
import useWalletConnect from "./hooks/useWalletConnect";

function App() {
  const {
    account,
    browserProvider,
    chainId,
    connectedToSepolia,
    connectWallet,
    disconnectWallet,
    error: walletError,
    switchToSepolia,
  } = useWalletConnect();
  const [addresses, setAddresses] = useState([]);
  const directory = useStudentDirectory(addresses, chainId);
  const handleRegistered = async () => {
    const nextAddresses = [...new Set([account, ...addresses])];
    setAddresses(nextAddresses);
    await directory.fetchStudents(nextAddresses);
  };
  const registration = useStudentRegistration(
    browserProvider,
    account,
    chainId,
    handleRegistered,
  );
  const currentStudent = directory.students.find(
    (student) => student.address.toLowerCase() === account.toLowerCase(),
  );
  const error = walletError || registration.error || directory.error;
  const handleDisconnect = async () => {
    setAddresses([]);
    await disconnectWallet();
  };
  const handleFetch = (nextAddresses) => {
    setAddresses(nextAddresses);
    directory.fetchStudents(nextAddresses);
  };

  return (
    <main className="portal">
      <header className="header">
        <div>
          <p className="eyebrow">Student Registration</p>
          <h1>Student Portal</h1>
          <p className="subtitle">Register once. Keep your details onchain.</p>
        </div>
        <ConnectButton
          account={account}
          connectWallet={connectWallet}
          disconnectWallet={handleDisconnect}
        />
      </header>

      {account && !connectedToSepolia && (
        <div className="notice warning">
          Your wallet is on another network.{" "}
          <button type="button" onClick={switchToSepolia}>
            Switch to Sepolia
          </button>
        </div>
      )}
      {registration.message && (
        <div className="notice success">{registration.message}</div>
      )}
      {error && <div className="notice error">{error}</div>}

      <section className="grid">
        <RegistrationForm
          loading={registration.loading}
          onRegister={registration.registerStudent}
        />
        <StudentDetails student={currentStudent} />
      </section>

      <StudentDirectory
        key={account}
        account={account}
        loading={directory.loading}
        onFetch={handleFetch}
        students={directory.students}
      />
    </main>
  );
}

export default App;
