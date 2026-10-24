const url = "https://studenthub-1-b9rt.onrender.com";

const cards = document.querySelector(".cards");
const totalStudents = document.querySelector("#total-students");
const studentForm = document.querySelector("#student-form");
const formMessage = document.querySelector("#form-message");

// Get one student by name
async function getName(name) {
  try {
    const response = await fetch(`${url}/${encodeURIComponent(name)}`);

    if (!response.ok) {
      throw new Error("Student not found");
    }

    const student = await response.json();

    cards.innerHTML = `
      <div class="card">
        <h2>ID = ${student[0]}</h2>
        <h1>Name = ${student[1]}</h1>
        <h3>Age = ${student[2]}</h3>

        <button onclick="allStudents()">
          Back to All Students
        </button>

        <button onclick="updateStudent(${student[0]})">
          Update
        </button>

        <button onclick="deleteStudent(${student[0]})">
          Delete
        </button>
      </div>
    `;
  } catch (error) {
    console.error("Error getting student:", error);
    alert("Could not find this student.");
  }
}

// Get all students
async function allStudents() {
  try {
    const response = await fetch(`${url}/students`);

    if (!response.ok) {
      throw new Error("Failed to get students");
    }

    const data = await response.json();

    totalStudents.textContent = data.length;
    cards.innerHTML = "";

    if (data.length === 0) {
      cards.innerHTML = "<p>No students found.</p>";
      return;
    }

    for (let std of data) {
      let students = `
        <div class="card">
          <h2>ID = ${std[0]}</h2>
          <h1>Name = ${std[1]}</h1>
          <h3>Age = ${std[2]}</h3>

          <button onclick="getName('${String(std[1])
            .replace(/\\/g, "\\\\")
            .replace(/'/g, "\\'")}')">
            More
          </button>

          <button onclick="updateStudent(${std[0]})">
            Update
          </button>

          <button onclick="deleteStudent(${std[0]})">
            Delete
          </button>
        </div>
      `;

      cards.innerHTML += students;
    }
  } catch (error) {
    console.error("Error getting students:", error);
    alert("Could not load students. Check the server.");
  }
}

// Add a student
studentForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.querySelector("#student-name").value.trim();
  const age = document.querySelector("#student-age").value;

  if (!name || !age || Number(age) < 1) {
    formMessage.textContent = "Please enter a valid name and age.";
    return;
  }

  try {
    const response = await fetch(
      `${url}/product?name=${encodeURIComponent(name)}&age=${encodeURIComponent(age)}`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to add student");
    }

    formMessage.textContent = "Student added successfully!";
    studentForm.reset();

    await allStudents();
  } catch (error) {
    formMessage.textContent = "Could not add student. Check the server.";
    console.error("Error adding student:", error);
  }
});

// Delete a student
async function deleteStudent(id) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this student?",
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${url}/delete/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete student");
    }

    formMessage.textContent = "Student deleted successfully!";

    await allStudents();
  } catch (error) {
    console.error("Error deleting student:", error);
    alert("Could not delete student. Check the server.");
  }
}

// Update a student
async function updateStudent(id) {
  const name = prompt("Enter new student name:");

  if (name === null) return;

  const age = prompt("Enter new student age:");

  if (age === null) return;

  if (
    !name.trim() ||
    !age.trim() ||
    !Number.isInteger(Number(age)) ||
    Number(age) < 1
  ) {
    alert("Please enter a valid name and age.");
    return;
  }

  try {
    const response = await fetch(
      `${url}/update/${id}?name=${encodeURIComponent(name.trim())}&age=${encodeURIComponent(age)}`,
      {
        method: "PUT",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update student");
    }

    formMessage.textContent = "Student updated successfully!";

    await allStudents();
  } catch (error) {
    console.error("Error updating student:", error);
    alert("Could not update student. Check the server.");
  }
}

// Load students when the page opens
allStudents();