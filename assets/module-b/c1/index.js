function getTopCourses(enrollments, topN) {
  // TODO: your code here
  return [];
}

// Example usage:
const enrollments = [
  { course: "JavaScript Basics", student: "Alice" },
  { course: "JavaScript Basics", student: "Bob" },
  { course: "Advanced CSS", student: "Charlie" },
  { course: "Advanced CSS", student: "Eve" },
  { course: "React for Beginners", student: "Frank" },
  { course: "Advanced CSS", student: "Dave" },
  { course: "Laravel for Beginners", student: "Grace" },
];

getTopCourses(enrollments, 3);
// Output: [{ course: 'Advanced CSS', count: 3 }, { course: 'JavaScript Basics', count: 2 }, { course: 'React for Beginners', count: 1 }]

const enrollments2 = [
  { course: "Python 101", student: "Ivy" },
  { course: "Python 101", student: "Jack" },
  { course: "Python 101", student: "Kim" },
  { course: "Python 101", student: "Leo" },
  { course: "Data Structures", student: "Mia" },
  { course: "Data Structures", student: "Noah" },
  { course: "Web Security", student: "Olivia" },
];

getTopCourses(enrollments2, 2);
// Output: [{ course: 'Python 101', count: 4 }, { course: 'Data Structures', count: 2 }]
