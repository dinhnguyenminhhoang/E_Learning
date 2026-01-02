export function buildQuestionBody(formData: any) {
  const body: any = {
    type: formData.type,
    questionText: formData.questionText,
    explanation: formData.explanation,
    points: formData.points,
  };

  if (formData.type === "multiple_choice" || formData.type === "true_false") {
    body.options = formData.options.map((option: any) => ({
      text: option.text,
      isCorrect: option.isCorrect,
    }));
  }

  if (formData.type === "matching") {
    body.matchingPairs = formData.matchingPairs;
  }

  return body;
}