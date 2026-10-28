import type { EventText } from "./types";

// The Negotiation Workshop's wording in each language, filled in on setup
// (lib/board/setup.ts) for any language the event doesn't have yet. Admins
// edit or clear them on the hub's Events tab afterwards.
export const NEGOTIATION_TRANSLATIONS: Partial<Record<string, EventText>> = {
  es: {
    title: "Taller de negociación con Emily Epstein",
    tag: "Taller · UC Berkeley",
    hostTitle: "Profesora de negociación, UC Berkeley Law · CEO, Oakbay Consulting",
    description:
      "Aprende a negociar el precio de un carro, y cualquier otra cosa, con alguien que lo enseña en Berkeley Law. Trae tus preguntas.",
  },
  "zh-Hans": {
    title: "谈判讲座：Emily Epstein 主讲",
    tag: "讲座 · UC Berkeley",
    hostTitle: "UC Berkeley Law 谈判课讲师 · Oakbay Consulting CEO",
    description: "跟在 Berkeley Law 教谈判的老师学怎么砍车价，学会了别的东西也能谈。带上你的问题来吧。",
  },
  tl: {
    title: "Negotiation Workshop kasama si Emily Epstein",
    tag: "Workshop · UC Berkeley",
    hostTitle: "Negotiation Lecturer, UC Berkeley Law · CEO, Oakbay Consulting",
    description:
      "Matutong tumawad sa presyo ng kotse, at sa kahit ano pa, mula sa isang nagtuturo nito sa Berkeley Law. Dalhin ang mga tanong mo.",
  },
  vi: {
    title: "Buổi học thương lượng với Emily Epstein",
    tag: "Buổi học · UC Berkeley",
    hostTitle: "Giảng viên thương lượng, UC Berkeley Law · CEO, Oakbay Consulting",
    description:
      "Học cách trả giá khi mua xe, và cả những chuyện khác, từ người đang dạy môn này ở Berkeley Law. Mang theo câu hỏi của bạn nhé.",
  },
  ko: {
    title: "Emily Epstein과 함께하는 협상 워크숍",
    tag: "워크숍 · UC Berkeley",
    hostTitle: "UC Berkeley Law 협상 강사 · Oakbay Consulting CEO",
    description:
      "Berkeley Law에서 협상을 가르치는 분에게 차 값, 그리고 그 밖의 무엇이든 흥정하는 법을 배워 보세요. 궁금한 건 들고 오세요.",
  },
  fa: {
    title: "کارگاه مذاکره با Emily Epstein",
    tag: "کارگاه · UC Berkeley",
    hostTitle: "مدرس مذاکره، UC Berkeley Law · مدیرعامل Oakbay Consulting",
    description:
      "از کسی که توی Berkeley Law مذاکره درس می‌ده یاد بگیرید چطور سر قیمت ماشین، و هر چیز دیگه‌ای، چونه بزنید. سؤال‌هاتون رو بیارید.",
  },
  hy: {
    title: "Բանակցությունների դասընթաց Emily Epstein-ի հետ",
    tag: "Դասընթաց · UC Berkeley",
    hostTitle: "Բանակցությունների դասախոս, UC Berkeley Law · Oakbay Consulting-ի գործադիր տնօրեն",
    description:
      "Սովորեք սակարկել մեքենայի գինը, և ցանկացած այլ բան, մի մարդուց, ով դա դասավանդում է Berkeley Law-ում։ Բերեք ձեր հարցերը։",
  },
};
