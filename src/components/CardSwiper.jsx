import React, { useState, useContext, useEffect } from "react";
import { cardsContext } from "../Context/CardsContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IoChevronBackOutline } from "react-icons/io5";
import "swiper/css";
import "swiper/css/effect-cards";

import "./cardSwiper.css";

import { EffectCards } from "swiper/modules";

export default function CardSwiper() {
  const [mainSwiper, setMainSwiper] = useState("block");
  const [sideSwiper, setSideSwiper] = useState("none");
  const [backBtn, setBackBtn] = useState("none");
  const { cards, cardPlayed } = useContext(cardsContext);

  const handleClick = () => {
    setMainSwiper("none");
    setSideSwiper("block");
    setBackBtn("flex");
    window.history.pushState(null, "", window.location.href); // Push a new state to history
  };

  const handleBack = () => {
    setMainSwiper("block");
    setSideSwiper("none");
    setBackBtn("none");
  };

  useEffect(() => {
    // Custom back button handling
    const handlePopState = (event) => {
      if (sideSwiper === "block") {
        handleBack();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [sideSwiper]);

  return (
    <>
      <Swiper
        style={{ display: mainSwiper }}
        effect={"cards"}
        grabCursor={true}
        modules={[EffectCards]}
        className="mySwiper">
        {cards.map((card, index) => (
          <SwiperSlide key={index}>
            <div
              className="d-flex justify-content-center align-items-center hidden-card position-relative"
              onClick={() => {
                card.handleCards();
                handleClick();
              }}
              target="_blank"
              rel="noopener noreferrer">
              <img
                width={"100%"}
                src={card.cardImg || "./imgs/card1.jpg"}
                className="position-relative"
                alt="Card"
              />
              <h5 className="hidden-card-title position-absolute">
                {card.title || "Mohammed Osama"}
              </h5>
              <img
                src={card.img}
                className="position-absolute hidden-card-img"
                alt={card.title}
              />
              <p className="hidden-card-text position-absolute text-center text-black ">
                {card.text ||
                  "Hello, I'm Mohammed Osama, a Front-End Developer."}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        style={{ display: sideSwiper }}
        effect={"cards"}
        loop={true}
        grabCursor={true}
        modules={[EffectCards]}
        className="mySwiper">
        {cardPlayed.map((card, index) => (
          <SwiperSlide key={index}>
            <a
              className="d-flex justify-content-center align-items-center hidden-card position-relative"
              href={card.URL}>
              <img
                width={"100%"}
                src={card.cardImg || "./imgs/card1.jpg"}
                className="position-relative"
                alt="Card"
              />
              <h5 className="hidden-card-title position-absolute">
                {card.title || "Mohammed Osama"}
              </h5>
              <img
                src={card.img}
                className="position-absolute hidden-card-img"
                alt={card.title}
              />
              <p className="hidden-card-text position-absolute text-center text-black pt-2">
                {card.text ||
                  "Hello, I'm Mohammed Osama, a Front-End Developer."}
              </p>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
      <button
        className=" btn-circle "
        style={{
          position: "fixed",
          top: "5px",
          left: "5px",
          fontSize: "1.5rem",
          display: backBtn,
        }}
        onClick={handleBack}>
        <IoChevronBackOutline />
      </button>
    </>
  );
}
