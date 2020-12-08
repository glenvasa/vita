import React from "react";

const RegisterPage = () => {
  return (
    <div>
      <div>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => onChange(e)}
        />
      </div>
    </div>
  );
};

export default RegisterPage;
