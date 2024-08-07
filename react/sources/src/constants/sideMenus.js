//사이드 메뉴 종류

/*
  수정페이지는 학생이면 student-edit 처럼 앞의 단어는 관련 단어로 하고 , 뒤에 -edit 이 따라오도록 이름을 제작한다.
*/
export const sideMenus = [
  {
    title: "학생 관리",
    menus: [
      {
        name: "학생 조회",
        href: "/student",
      },

      {
        name: "등/하원 기록 조회",
        href: "/attendance-student",
      },
      {
        name: "학생 정보 수정",
        href: "/student-edit",
        display: "none",
      },
      {
        name: "학생 추가",
        href: "/student-add",
        display: "none",
      },
      {
        name: "학교 조회",
        href: "/school",
      },
      {
        name: "학교 추가",
        href: "/school-add",
        display: "none",
      },
      {
        name: "학교 정보 수정",
        href: "/school-edit",
        display: "none",
      },
    ],
  },
  {
    title: "교직원 관리",
    menus: [
      {
        name: "교직원 조회",
        href: "/teacher",
      },
      {
        name: "교직원 정보 수정",
        href: "/teacher-edit",
        display: "none",
      },
      {
        name: "수업 조회",
        href: "/manage_subject",
      },
      {
        name: "수업 추가",
        href: "/subject-add",
        display: "none",
      },
      {
        name: "수업 일정 조회",
        href: "/manage_schedule",
      },
      {
        name: "수업 일정 추가",
        href: "/plan-add",
        display: "none",
      },
      {
        name: "수업 일정 수정",
        href: "/plan-edit",
        display: "none",
      },
      {
        name: "수업 일정 확인",
        href: "/subject-show",
        display: "none",
      },
      {
        name: "수업 수정",
        href: "/subject-edit",
        display: "none",
      },
    ],
  },
  {
    title: "관리자용 페이지",
    menus: [
      {
        name: "수정 로그 보기",
        href: "/log_view",
      },
      {
        name: "작업 권한 관리",
        href: "/admin_permissions",
      },
      {
        name: "사용자 권한 관리",
        href: "/user_permissions",
      },
    ],
  },
  
];
