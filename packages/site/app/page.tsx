import PrivateVotingDemo from "@/components/PrivateVotingDemo";
import FHEVMTest from "@/components/FHEVMTest";
import ContractTest from "@/components/ContractTest";

export default function Home() {
  return (
    <main className="">
      <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
        <FHEVMTest />
        <div className="w-full border-t border-gray-200 my-8"></div>
        <ContractTest />
        <div className="w-full border-t border-gray-200 my-8"></div>
        <PrivateVotingDemo />
      </div>
    </main>
  );
}
