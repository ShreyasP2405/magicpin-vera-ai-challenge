export default function TerminalBlock({ children, title }) {
  return (
    <div className="terminal-block">
      <div className="terminal-dots">
        <span style={{ background: '#ef4444' }}></span>
        <span style={{ background: '#f59e0b' }}></span>
        <span style={{ background: '#22c55e' }}></span>
        {title && (
          <span className="ml-3 text-xs text-gray-500 font-mono">{title}</span>
        )}
      </div>
      <pre className="whitespace-pre overflow-x-auto text-sm leading-relaxed">
        {children}
      </pre>
    </div>
  );
}
