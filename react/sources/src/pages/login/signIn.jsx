import React from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import Button from "../../Components/ButtonTop";


export default function LoginPage() {
  async function loging(e) {
    e.preventDefault();
    const inputID = e.target.elements.ID.value;
    const inputPW = e.target.elements.PASSWORD.value;

    

    

    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/server/login`, 
          { username: inputID, password: inputPW }, 
          { withCredentials: true }
      );
      console.log(response);
  
      if (response.data.success) {
        alert("로그인 성공");
        const userData = { name: inputID, author: "admin" };
    
        // 현재 시간으로부터 1시간 후를 계산
        const inOneHour = new Date(new Date().getTime() + 60 * 60 * 1000);
    
        Cookies.set('user', JSON.stringify(userData), { expires: inOneHour });
        window.location.href = "/student";
    } else {
        alert("로그인 실패: " + response.data.message);
    }
  } catch (error) {
      if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          alert("통신 실패: " + (error.response && error.response.data ? error.response.data.message : '알 수 없는 에러'));
      } else if (error.request) {
          console.log(error.request);
          alert("서버로부터 응답이 없습니다: " + error.message);
      } else {
          console.log("Error", error.message);
          alert("통신 오류: " + error.message);
      }
      console.log(error.config);
  }

  }

  return (
    <>
      <div className="absolute w-[100vw] h-[100vh] top-0 left-0 bg-black opacity-50" />
      <div className="absolute w-[100vw] h-[100vh] top-0 left-0 flex justify-center items-center">
        <div className="w-[450px] h-80 bg-white rounded-lg shadow-2xl">
          <div className="flex justify-between pt-2 pr-2">
            <span className="fontA text-3xl pl-9 pt-2">로그인</span>
            <Button
              label={"X"}
              width={50}
              URL={"/student"}
              bgColor={"5272F2"}
            ></Button>
          </div>
          <form onSubmit={(e) => loging(e)} className="flex justify-center">
            <div className="flex flex-col">
              <input
                className="px-2 w-80 h-11 rounded-md border border-[#000000] my-7"
                name="ID"
                placeholder="아이디"
              />
              <input
                className="px-2 w-80 h-11 rounded-md border border-[#000000]"
                name="PASSWORD"
                placeholder="비밀번호"
                type="password"
              />
              <div className="flex justify-evenly pt-6">
                <button className="text-xs w-20 h-10 px-2 rounded-md border bg-[#5272F2] text-white">
                  로그인
                </button>
                <Button
                  label="신규등록"
                  width={80}
                  URL={"/register-page"}
                ></Button>
              </div>
              <span className="text-xs font-extrabold pt-3 text-center">
                신규등록을 통해 새로운 교사의 계정 추가 가능
              </span>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}