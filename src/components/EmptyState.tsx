const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Calendar-like SVG icon */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="账单日历"
      >
        <title>账单日历</title>
        <rect
          x="8"
          y="10"
          width="32"
          height="30"
          rx="3"
          stroke="#d1d5db"
          strokeWidth="2"
        />
        <path d="M8 18h32" stroke="#d1d5db" strokeWidth="2" />
        <path
          d="M16 8v5"
          stroke="#d1d5db"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M32 8v5"
          stroke="#d1d5db"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <text
          x="24"
          y="35"
          textAnchor="middle"
          fontSize="14"
          fill="#d1d5db"
          fontWeight="bold"
        >
          ¥
        </text>
      </svg>

      {/* Title */}
      <p className="text-lg font-medium text-gray-500 mt-4">
        还没有账单数据
      </p>

      {/* Description */}
      <p className="text-sm text-gray-400 mt-2 whitespace-pre-line">
        点击右上角的「新建账单」按钮，
        {'\n'}
        开始记录你的还款计划。
      </p>

      {/* Tip box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 max-w-sm">
        <p className="text-sm font-medium text-blue-700">小提示</p>
        <p className="text-xs text-blue-600 mt-1">
          • 单次账单：一次性还款，如信用卡消费
        </p>
        <p className="text-xs text-blue-600 mt-1">
          • 分期账单：按月分期还款，如贷款或分期购物
        </p>
      </div>
    </div>
  )
}

export default EmptyState
