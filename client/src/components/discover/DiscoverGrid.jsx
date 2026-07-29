import DiscoverCard from "./DiscoverCard";

export default function DiscoverGrid({ users = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {users.map((user) => (
        <DiscoverCard key={user.userId} user={user} />
      ))}
    </div>
  );
}
