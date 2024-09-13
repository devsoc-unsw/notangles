class AuthorisationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthorisationError';
    }
}

class PermissionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PermissionError';
    }
}

interface EmptyObject {
    [key: string]: never;
}

interface ErrorObject {
    error: string;
    errorCode: number;
}

interface Data {
    users: User[];
    quizzes: Quiz[];
    trash: Quiz[];
}


type Timeout = ReturnType<typeof setTimeout>;
interface DataTest {
    users: User[];
    quizzes: Quiz[];
    trash: Quiz[];
    timeouts: Timeout[];
}

interface User {
    userId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    password: string;
    sessions: {
        sessionId: string;
    }[];
    passwordHistory: string[];
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
}

interface Quiz {
    userId: number;
    quizId: number;
    name: string;
    description: string;
    timeCreated: number;
    timeLastEdited: number;
    numQuestions: number;
    questions: Question[];
    duration: number;
}

interface Question {
    questionId: number;
    question: string;
    duration: number;
    points: number;
    answers: Answer[];
}

interface Answer {
    answerId: number;
    answer: string;
    colour: string;
    correct: boolean;
}

interface QuestionBody {
    question: string;
    duration: number;
    points: number;
    answers: QuestionBodyAnswer[];
}

interface QuestionBodyAnswer {
    answer: string;
    correct: boolean;
}

interface AdminUserDetailsReturn {
    user: {
        userId: number;
        name: string;
        email: string;
        numSuccessfulLogins: number;
        numFailedPasswordsSinceLastLogin: number;
    }
}

interface AdminQuizInfoQuestion {
    questionId: number;
    question: string;
    duration: number;
    points: number;
    answers: Answer[];
}

interface AdminQuizInfoReturn {
    quizId: number;
    name: string;
    timeCreated: number;
    timeLastEdited: number;
    description: string;
    numQuestions: number;
    questions: AdminQuizInfoQuestion[];
    duration: number;
}

interface AdminQuizListReturn {
    quizzes: { quizId: number; name: string; }[];
}

interface AdminQuizTrashViewReturn {
    quizzes: { quizId: number; name: string; }[];
}


