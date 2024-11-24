import React from "react";
import { createContext, useState } from "react";

import Axios from "axios";
export const cardsContext = createContext();

function CardsProvider({ children }) {
  
  const [sideCard, setSideCard] = useState({});

  const [projects] = useState([]);

  const [skills] = useState([
    {
      title: "HTML",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-plain.svg",
      text: "HTML",
      cardImg: "./imgs/card5.jpg",
    },
    {
      title: "CSS",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-plain.svg",
      text: "CSS",
      cardImg: "./imgs/card2.jpg",
    },
    {
      title: "Bootstrap",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-plain.svg",
      text: "Bootstrap",
      cardImg: "./imgs/card8.jpg",
    },
    {
      title: "JavaScript",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      text: "JavaScript",
      cardImg: "./imgs/card6.jpg",
    },
    {
      title: "TypeScript",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
      text: "TypeScript",
      cardImg: "./imgs/card2.jpg",
    },
    {
      title: "React.JS",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      text: "React.JS",
      cardImg: "./imgs/card7.jpg",
    },
    {
      title: "GitHub",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
      text: "GitHub",
      cardImg: "./imgs/card11.jpg",
    },
    {
      title: "SQL",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
      text: "SQL",
      cardImg: "./imgs/card5.jpg",
    },
    {
      title: "Python",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
      text: "Python",
      cardImg: "./imgs/card1.jpg",
    },
    {
      title: "PHP",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
      text: "PHP",
      cardImg: "./imgs/card3.jpg",
    },
    {
      title: "C++",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
      text: "C++",
      cardImg: "./imgs/card2.jpg",
    },
  ]);
  const [social] = useState([
    {
      title: "Linkedin",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg",
      text: "Linkedin",
      cardImg: "./imgs/card2.jpg",
      URL: "https://www.linkedin.com/in/mohamed-osama3000/",
      desc: "Click on the card to visit my linkedin profile",
    },
    {
      title: "Github",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
      text: "Github",
      cardImg: "./imgs/card11.jpg",
      URL: "https://github.com/m0svmv",
      desc: "Click on the card to visit my github profile",
    },
    {
      title: "Gmail",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg",

      text: "Gmail",
      cardImg: "./imgs/card1.jpg",
      URL: "mailto:medoosama822@gmail.com",
      desc: "Click on the card to send me an email",
    },

    {
      title: "Facebook",
      img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg",
      text: "Facebook",
      cardImg: "./imgs/card2.jpg",
      URL: "https://www.facebook.com/MOsvmv17",
      desc: "Click on the card to Follow me on Facebook",
    },
    {
      title: "Instagram",
      img: "https://static.cdnlogo.com/logos/i/92/instagram.svg",
      text: "Instagram",
      cardImg: "./imgs/card9.jpg",
      URL: "https://www.instagram.com/m.osama_17/",
      desc: "Follow me on Instagram",
    },
  ]);

  const [cardPlayed, setCardPlayed] = useState([]);

  const handleCvUpdate = () => {
    setCardPlayed([
      {
        title: "My CV",
        img: "/imgs/cv.jpg",
        text: "Click to Download the CV",
        cardImg: "./imgs/card2.jpg",
        URL: "https://drive.usercontent.google.com/u/0/uc?id=18_ffdEgHooDPLtbjLEKOCgnqSuY3Nthe&export=download",
        desc: "Click on the card to download my CV",
      },
    ]);
  };
  const handleSkillsUpdate = () => {
    setCardPlayed(skills); // Updates the state
  };
  const handleContactUpdate = () => {
    setCardPlayed(social); // Updates the state
  };
  const handleProjectsUpdate = () => {
    const fetchRepositories = async () => {
      try {
        const response = await Axios.get(
          "https://api.github.com/users/m0svmv/repos"
        );

        const formattedProjects = response.data.map((repo) => ({
          title: repo.name,
          img: repo.description,
          text: "Most used Lang: " + repo.language || "No Language Specified",
          cardImg: `./imgs/card${Math.floor(Math.random() * 11 + 1)}.jpg`,
          URL: repo.homepage || `https://github.com/${repo.full_name}`,
          desc: "Click on the card to visit the Demo",
        }));

        setCardPlayed(formattedProjects);
      } catch (error) {
        console.error("Error fetching GitHub repositories:", error);
      }
    };

    fetchRepositories(); 
  };

  const [cards] = useState([
    {
      title: "Mohammed Osama",
      img: "/imgs/mohammedOsama2.jpg",
      text: "I'm Mohammed Osama, a Frontend developer.",
      cardImg: "./imgs/card6.jpg",
      handleCards: () => handleCvUpdate(),
      desc: `As a computer engineering student interested in several areas, particularly the web development and AI. Enthusiastic
to explore these fields further and gain a deeper understanding of their applications. Having experience in both fields is summed up in
large and small projects and some freelance work. Can work in a team or alone, reflecting the the ability to adapt. Having ambitions and
passion to achieve major achievements in this field`,
    },
    {
      title: "My Skills",
      img: "/imgs/skills.jpg",
      text: "Know more about my skills!!",
      cardImg: "./imgs/card3.jpg",
      handleCards: () => handleSkillsUpdate(),
      desc: "You can chose any of the following skills to display them on the screen",
    },
    {
      title: "My Projects",
      img: "/imgs/projects.jpg",
      text: "See my projects!!",
      cardImg: "./imgs/card4.jpg",
      handleCards: () => handleProjectsUpdate(),
      desc: "You can chose any of the following projects to display them on the screen and try a demo of them",
    },
    {
      title: "Contact Me",
      img: "/imgs/Contact Me.jpg",
      text: "Contact me!!",
      cardImg: "./imgs/card2.jpg",
      handleCards: () => handleContactUpdate(),
      desc: "You can chose any of the following contacts to display them on the screen",
    },
  ]);

  return (
    <cardsContext.Provider
      value={{
        cards,
        projects,
        setSideCard,
        sideCard,
        cardPlayed,
        setCardPlayed,
      }}>
      {children}
    </cardsContext.Provider>
  );
}

export default CardsProvider;
