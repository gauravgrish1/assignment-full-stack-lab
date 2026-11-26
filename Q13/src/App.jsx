const skills = ["HTML", "CSS", "JavaScript", "React", "Node.js"];

const projects = [
  {
    name: "Portfolio Website",
    description: "A website to introduce myself and show my work."
  },
  {
    name: "Task Tracker",
    description: "A simple app for keeping track of daily tasks."
  },
  {
    name: "Weather App",
    description: "An app that displays the weather for a chosen city."
  }
];

function App() {
  return (
    <>
      <header className="header">
        <h1>Your Name</h1>
        <nav>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="intro">
          <p>Hello, I am</p>
          <h2>Your Name</h2>
          <h3>Aspiring Web Developer</h3>
          <p>I enjoy learning web development and building useful websites.</p>
          <a className="button" href="#projects">See My Projects</a>
        </section>

        <section id="about" className="section">
          <h2>About Me</h2>
          <p>
            I am learning how to create websites with HTML, CSS, JavaScript,
            and React. I like solving problems and trying new ideas.
          </p>
        </section>

        <section id="skills" className="section">
          <h2>My Skills</h2>
          <ul className="skill-list">
            {skills.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
        </section>

        <section id="projects" className="section">
          <h2>My Projects</h2>
          <div className="project-list">
            {projects.map((project) => (
              <article className="project" key={project.name}>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="section contact">
          <h2>Contact Me</h2>
          <p>Have a question or an idea? Send me an email.</p>
          <a className="button" href="mailto:hello@example.com">
            hello@example.com
          </a>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 Your Name</p>
      </footer>
    </>
  );
}

export default App;
