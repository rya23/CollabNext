import { motion } from "framer-motion";
import { FileText, User } from "lucide-react";
import { useRouter } from "next/navigation";

export interface DocumentCardProps {
  id: string;
  title: string;
  lastModified: string;
  author: string;
  status: string;
  progress: number;
}

export default function DocumentCard({
  id,
  title,
  lastModified,
  author,
  status,
  progress,
}: DocumentCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/document/${id}`);
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="group p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-gray-700 group-hover:bg-gray-600">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-400">{lastModified}</span>
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <User className="h-3 w-3" />
                {author}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Progress Bar */}
          <div className="hidden md:block w-32">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  status === "Completed"
                    ? "bg-green-500"
                    : status === "In Progress"
                    ? "bg-blue-500"
                    : "bg-gray-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === "Completed"
                ? "bg-green-500/20 text-green-400"
                : status === "In Progress"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-gray-500/20 text-gray-400"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
