import PrivateVotingDemo from "@/components/PrivateVotingDemo";
import FHEVMTest from "@/components/FHEVMTest";
import ContractTest from "@/components/ContractTest";
import PollDebug from "@/components/PollDebug";
import SimpleFHEVMTest from "@/components/SimpleFHEVMTest";
import FHEVMPollTest from "@/components/FHEVMPollTest";
import SimpleContractTest from "@/components/SimpleContractTest";
import ContractABITest from "@/components/ContractABITest";
import ContractCodeTest from "@/components/ContractCodeTest";

export default function Home() {
  return (
    <main className="">
      <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
        <FHEVMTest />
        <div className="w-full border-t border-gray-200 my-8"></div>
        <SimpleFHEVMTest />
        <div className="w-full border-t border-gray-200 my-8"></div>
        <FHEVMPollTest />
        <div className="w-full border-t border-gray-200 my-8"></div>
        <ContractCodeTest />
        <div className="w-full border-t border-gray-200 my-8"></div>
        <ContractABITest />
        <div className="w-full border-t border-gray-200 my-8"></div>
        <SimpleContractTest />
        <div className="w-full border-t border-gray-200 my-8"></div>
        <ContractTest />
        <div className="w-full border-t border-gray-200 my-8"></div>
        <PollDebug />
        <div className="w-full border-t border-gray-200 my-8"></div>
        <PrivateVotingDemo />
      </div>
    </main>
  );
}
