type Props = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
};

const StatusCard = ({ title, value, icon, bgColor }: Props) => {
  return (
    <div
      className={`border rounded-xl p-4 flex items-center justify-between bg-white`}
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-2xl font-semibold mt-1">{value}</h2>
      </div>
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center ${bgColor}`}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatusCard;
