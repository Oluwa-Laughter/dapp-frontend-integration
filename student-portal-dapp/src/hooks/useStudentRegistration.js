import { useState } from "react";
import { Contract } from "ethers";
import studentRegistrationAbi from "../abi/studentRegistration.json";
import { SEPOLIA_CHAIN_ID, STUDENT_REGISTRATION_ADDRESS } from "../constants";

export default function useStudentRegistration(
  browserProvider,
  account,
  chainId,
  onRegistered,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const registerStudent = async ({ name, age, course }) => {
    if (!account || chainId !== SEPOLIA_CHAIN_ID) {
      setError("Connect a wallet on Ethereum Sepolia first.");
      return false;
    }
    if (!name.trim() || !course.trim() || Number(age) <= 0) {
      setError("Enter a name, a valid age, and a course.");
      return false;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      const signer = await browserProvider.getSigner();
      const contract = new Contract(
        STUDENT_REGISTRATION_ADDRESS,
        studentRegistrationAbi,
        signer,
      );
      const transaction = await contract.register(
        name.trim(),
        Number(age),
        course.trim(),
      );
      await transaction.wait();
      setMessage("Registration confirmed.");
      onRegistered();
      return true;
    } catch (registrationError) {
      setError(
        registrationError.reason ||
          registrationError.shortMessage ||
          registrationError.message,
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { error, loading, message, registerStudent };
}
