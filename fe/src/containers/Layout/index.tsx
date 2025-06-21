import { Link, Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex h-full">
      <div className="flex flex-col w-[200px] gap-[1rem] border-r px-4">
        <Link
          to="form"
          className="py-2 px-5 bg-blue-500 text-slate-50 shadow rounded text-center"
        >
          Form
        </Link>
        <Link
          to="chat"
          className="py-2 px-5 bg-blue-500 text-slate-50 shadow rounded text-center"
        >
          Chat
        </Link>
      </div>
      <Outlet />
    </div>
  );
};

export default Home;
