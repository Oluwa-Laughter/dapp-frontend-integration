import { useMemo, useState } from "react";
import { Contract, Interface, isAddress } from "ethers";
import multicall2Abi from "../abi/multicall2.json";
import studentRegistrationAbi from "../abi/studentRegistration.json";
import {
  MULTICALL2_ADDRESS,
  SEPOLIA_CHAIN_ID,
  STUDENT_REGISTRATION_ADDRESS,
  sepoliaProvider,
} from "../constants";

export default function useStudentDirectory(addresses, chainId) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const registrationInterface = useMemo(
    () => new Interface(studentRegistrationAbi),
    [],
  );

  const validAddresses = useMemo(
    () => [...new Set(addresses.filter((address) => isAddress(address)))],
    [addresses],
  );

  const fetchStudents = async (requestedAddresses = validAddresses) => {
    const addressesToRead = [
      ...new Set(requestedAddresses.filter((address) => isAddress(address))),
    ];

    if (chainId !== SEPOLIA_CHAIN_ID) {
      setError("Connect to Ethereum Sepolia first.");
      return;
    }
    if (!isAddress(MULTICALL2_ADDRESS)) {
      setError(
        "Set VITE_MULTICALL2_ADDRESS to a deployed Multicall2 contract.",
      );
      return;
    }
    if (addressesToRead.length === 0) {
      setError("Enter at least one valid student address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const multicall = new Contract(
        MULTICALL2_ADDRESS,
        multicall2Abi,
        sepoliaProvider,
      );
      const registeredCalls = addressesToRead.map((address) => ({
        target: STUDENT_REGISTRATION_ADDRESS,
        callData: registrationInterface.encodeFunctionData("registered", [
          address,
        ]),
      }));
      const [, registeredResults] =
        await multicall.aggregate.staticCall(registeredCalls);
      const registeredAddresses = addressesToRead.filter(
        (address, index) =>
          registrationInterface.decodeFunctionResult(
            "registered",
            registeredResults[index],
          )[0],
      );

      if (registeredAddresses.length === 0) {
        setStudents([]);
        return;
      }

      const studentCalls = registeredAddresses.map((address) => ({
        target: STUDENT_REGISTRATION_ADDRESS,
        callData: registrationInterface.encodeFunctionData("getStudent", [
          address,
        ]),
      }));
      const [, studentResults] =
        await multicall.aggregate.staticCall(studentCalls);
      setStudents(
        registeredAddresses.map((address, index) => {
          const [name, age, course] =
            registrationInterface.decodeFunctionResult(
              "getStudent",
              studentResults[index],
            );
          return { address, name, age: age.toString(), course };
        }),
      );
    } catch (fetchError) {
      setError(
        fetchError.reason || fetchError.shortMessage || fetchError.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return { error, fetchStudents, loading, students };
}
