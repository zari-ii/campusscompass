import { useMemo } from "react";

// Tag categories and their weights for calculating teaching style
const POSITIVE_TAGS = [
  "Clear Explanations", "Açıq izahat", "Понятные объяснения",
  "Helpful", "Kömək edən", "Полезный",
  "Engaging Lectures", "Cəlbedici mühazirələr", "Увлекательные лекции",
  "Available Outside Class", "Dərs xaricində mövcud", "Доступен вне занятий",
  "Great Feedback", "Əla rəy", "Отличная обратная связь",
  "Inspiring", "İlham verən", "Вдохновляющий",
  "Fair Grading", "Ədalətli qiymətləndirmə", "Справедливая оценка",
  "Extra Credit", "Əlavə bal", "Дополнительные баллы",
  // Psychologist tags
  "Active Listener", "Aktiv dinləyici", "Активный слушатель",
  "Confidential & Trustworthy", "Gizli və etibarlı", "Конфиденциально и надежно",
  "Friendly & Empathetic", "Dost və empatik", "Дружелюбный и эмпатичный",
  "Culturally Sensitive", "Mədəniyyətə həssas", "Культурно чувствительный",
  "Evidence-Based Approach", "Sübut əsaslı yanaşma", "Доказательный подход",
  "Flexible Scheduling", "Çevik cədvəl", "Гибкий график",
  "Affordable Care", "Münasib qiymət", "Доступный уход"
];

const NEGATIVE_TAGS = [
  "Tough Grader", "Sərt qiymətləndirmə", "Строгий оценщик",
  "Challenging Exams", "Çətin imtahanlar", "Сложные экзамены"
];

interface ReviewData {
  overall_rating: number;
  tags: string[] | null;
}

export interface TeachingStyleResult {
  score: number; // 1-5 score
  label: string;
  description: string;
}

export const calculateTeachingStyle = (reviews: ReviewData[]): TeachingStyleResult => {
  if (reviews.length === 0) {
    return { score: 0, label: "No reviews", description: "Not enough data" };
  }

  // Calculate average overall rating (normalize from 1-10 to 1-5)
  const avgRating = reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length;
  const normalizedRating = (avgRating / 10) * 5;

  // Count positive and negative tags
  let positiveCount = 0;
  let negativeCount = 0;
  let totalTags = 0;

  reviews.forEach(review => {
    if (review.tags && Array.isArray(review.tags)) {
      review.tags.forEach(tag => {
        totalTags++;
        if (POSITIVE_TAGS.some(pt => pt.toLowerCase() === tag.toLowerCase())) {
          positiveCount++;
        } else if (NEGATIVE_TAGS.some(nt => nt.toLowerCase() === tag.toLowerCase())) {
          negativeCount++;
        }
      });
    }
  });

  // Calculate tag-based modifier (-1 to +1)
  let tagModifier = 0;
  if (totalTags > 0) {
    tagModifier = (positiveCount - negativeCount) / totalTags;
  }

  // Combine rating and tags for final score
  // 70% weight on rating, 30% weight on tags
  const baseScore = normalizedRating * 0.7 + ((tagModifier + 1) * 2.5) * 0.3;
  const finalScore = Math.max(1, Math.min(5, Math.round(baseScore * 10) / 10));

  // Determine label and description
  const getStyleInfo = (score: number): { label: string; description: string } => {
    if (score >= 4.5) return { label: "Excellent", description: "Highly engaging & supportive" };
    if (score >= 3.5) return { label: "Good", description: "Clear & helpful" };
    if (score >= 2.5) return { label: "Average", description: "Standard teaching approach" };
    if (score >= 1.5) return { label: "Below Average", description: "May need improvement" };
    return { label: "Poor", description: "Significant issues reported" };
  };

  const { label, description } = getStyleInfo(finalScore);

  return { score: finalScore, label, description };
};

export const useTeachingStyle = (reviews: ReviewData[]) => {
  return useMemo(() => calculateTeachingStyle(reviews), [reviews]);
};
