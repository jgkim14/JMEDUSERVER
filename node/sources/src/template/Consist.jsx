import React from "react";
import "../style/index.css";
import SideBar from "./SideBar";
import Topbar from "./Topbar";
import MainPage from "../pages/student/main";
import LoginPage from "../pages/login/signIn";
import RegisterPage from "../pages/register/register";
import Product from "../pages/student/product";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentEdit from "../pages/student/student-edit/studentEdit";

export default function Consist() {
  return (
    <BrowserRouter>
      <div className="w-full h-full flex flex-col">
        <Topbar />
        <div className="flex h-full bg-[#FAFBFE]">
          <SideBar />
          <div className="w-full">
            <Routes>
              {/* 로그인 , 회원가입 페이지 */}
              <Route path="/sign-in" element={<LoginPage />} />
              <Route path="/register-page" element={<RegisterPage />} />
              {/* 학생관리 페이지 */}
              <Route path="/student" element={<MainPage />} />
              <Route path="/class" element={<Product />} />
              <Route
                path="/student-edit/:studentID"
                element={<StudentEdit />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
