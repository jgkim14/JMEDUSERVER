import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import PropTypes from "prop-types";
import { SEARCH_STUDENT } from "../../constants/searchFilter";
import { useState } from "react";
import Button from "../ButtonTop";
import DatePickerV1 from "../datePicker/DatePicker";

export default function SearchBox(props) {
  const today = new Date();
  const { onSubmit, option } = props;
  const [searchOption, setSearchOption] = useState("name");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      text: e.target.elements["nameText"].value,
      option: searchOption,
      startDate,
      endDate,
    });
  };

  const resetField = (e) => {
    e.preventDefault();
    document.querySelector("#text-field").value = "";
    setStartDate(today);
    setEndDate(today);
  };

  const filterOption = (option) => {
    if (option === "student") return SEARCH_STUDENT;
    else return false;
  };
  return (
    <div className="w-full p-10 fontA">
      <div className="w-full h-40 border border-[#B3A492] shadow-md rounded-md p-5">
        <form
          className="flex gap-4 w-full flex-col"
          onSubmit={(e) => handleSubmit(e)}
        >
          <div className="w-full flex">
            <select
              className="w-24 mr-5 rounded-md border border-[#B3A492]"
              onChange={(e) => setSearchOption(e.target.value)}
              id=""
            >
              {Object.values(filterOption(option)).map((filter) => (
                <option
                  key={filter.value}
                  value={filter.value}
                  className="fontA"
                >
                  {filter.name}
                </option>
              ))}
            </select>
            <input
              className="px-2 w-full h-11 rounded-md border border-[#B3A492]"
              name="nameText"
              id="text-field"
              placeholder={`검색기능을 이용하실 수 있습니다.`}
            />
          </div>
          <div className="mt-3 flex justify-end items-center gap-3 w-full">
            <div className="flex justify-center w-full h-full items-center">
              <span className="fontA text-lg">날짜 : </span>
              <DatePickerV1
                selected={startDate}
                onChange={(e) => setStartDate(e)}
              />
              <span className="px-10">~</span>
              <DatePickerV1
                selected={endDate}
                onChange={(e) => setEndDate(e)}
              />
            </div>
            <button className="text-xs w-16 h-10 px-2 rounded-md border bg-[#5272F2] text-white">
              검색
            </button>
            <Button onClick={resetField} label={"초기화"}>
              초기화
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

SearchBox.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  option: PropTypes.string,
};