import { useEffect, useMemo, useState } from "react";
import { LuCode, LuArrowLeft } from "react-icons/lu";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import ChallengeCard from "./components/ChallengeCard";
import ChallengeFilters from "./components/ChallengeFilters";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/empty-state.json";

const CodingList = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const params = {};
        if (difficulty) params.difficulty = difficulty;
        if (tag) params.tag = tag;

        const response = await axiosInstance.get(API_PATHS.CODING.CHALLENGES, { params });
        setChallenges(response.data.challenges || []);
      } catch (error) {
        console.error("Failed to load challenges:", error);
        toast.error("Failed to load coding challenges");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [difficulty, tag]);

  const allTags = useMemo(() => {
    const tags = new Set();
    challenges.forEach((c) => c.tags?.forEach((t) => tags.add(t)));
    return [...tags].sort();
  }, [challenges]);

  const grouped = useMemo(() => {
    const groups = { Easy: [], Medium: [], Hard: [] };
    challenges.forEach((c) => {
      if (groups[c.difficulty]) groups[c.difficulty].push(c);
    });
    return groups;
  }, [challenges]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <LuArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          {/* <span className="p-3 rounded-2xl bg-blue-600 text-white shadow-md">
            <LuCode size={24} />
          </span> */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Coding Round Simulator</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Practice coding problems in JavaScript with test cases and draft autosave.
            </p>
          </div>
        </div>
      </div>

      <ChallengeFilters
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        tag={tag}
        onTagChange={setTag}
        allTags={allTags}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-white/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-48 mx-auto mb-4">
            <Lottie animationData={emptyAnimation} loop />
          </div>
          <p className="text-gray-600">No challenges found. Try adjusting your filters.</p>
        </div>
      ) : difficulty ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge._id} challenge={challenge} />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {["Easy", "Medium", "Hard"].map(
            (level) =>
              grouped[level].length > 0 && (
                <section key={level}>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">{level}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grouped[level].map((challenge) => (
                      <ChallengeCard key={challenge._id} challenge={challenge} />
                    ))}
                  </div>
                </section>
              )
          )}
        </div>
      )}
    </div>
  );
};

export default CodingList;
