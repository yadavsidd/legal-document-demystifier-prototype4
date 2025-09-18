import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";

const TextGenerateEffect = ({ words, className }: { words: string; className?: string; }) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");
  
  useEffect(() => {
    animate(
      "span",
      { opacity: 1, y: 0 },
      { duration: 0.3, delay: stagger(0.05), type: "spring", stiffness: 100, damping: 12 }
    );
  }, [scope.current]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              initial={{ opacity: 0, y: 10 }}
              className="dark:text-white text-base-900 opacity-0"
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={`font-bold font-display text-4xl md:text-6xl leading-tight ${className}`}>
      {renderWords()}
    </div>
  );
};

export default TextGenerateEffect;