import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AlgorithmMarketplace from "@/pages/AlgorithmMarketplace";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/algorithms" element={<AlgorithmMarketplace />} />
        <Route path="/algorithms/:id/run" element={<div className="text-center text-xl">算法运行页面 - 开发中</div>} />
        <Route path="/algorithms/:id/subscribe" element={<div className="text-center text-xl">算法订阅页面 - 开发中</div>} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}
