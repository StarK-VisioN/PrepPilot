const HeatMap = ({ data }) => {
    if (!data?.length) return null;

    return (
        <div className="grid grid-cols-7 gap-2">
            {data.map((cell) => (
                <div key={cell.day} className="text-center">
                    <div
                        className="h-10 rounded-lg mb-1 transition-colors"
                        style={{
                            backgroundColor: `rgba(99, 102, 241, ${Math.max(0.1, cell.intensity / 100)})`,
                        }}
                        title={`${cell.count} activities`}
                    />
                    <span className="text-[10px] text-gray-500">{cell.day}</span>
                </div>
            ))}
        </div>
    );
};

export default HeatMap;
