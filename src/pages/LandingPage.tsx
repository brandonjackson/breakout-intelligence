export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-3xl font-bold text-indigo-900 mb-2">Breakout Intelligence</h1>
      <p className="text-gray-600 mb-8">Real-time insights from workshop participants</p>
      <div className="text-left max-w-md space-y-3 text-sm text-gray-600">
        <div className="flex gap-3 items-start">
          <span className="text-indigo-600 font-bold mt-0.5">1.</span>
          <span>Receive a unique invite link from your workshop organiser</span>
        </div>
        <div className="flex gap-3 items-start">
          <span className="text-indigo-600 font-bold mt-0.5">2.</span>
          <span>Answer Likert-scale questions during plenary and breakout sessions</span>
        </div>
        <div className="flex gap-3 items-start">
          <span className="text-indigo-600 font-bold mt-0.5">3.</span>
          <span>View aggregated results and group breakdowns in real time</span>
        </div>
        <div className="flex gap-3 items-start">
          <span className="text-indigo-600 font-bold mt-0.5">4.</span>
          <span>No registration required — your invite link is your identity</span>
        </div>
      </div>
    </div>
  );
}
