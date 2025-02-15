import React from "react";
import { OverlayButton } from "../index";
import CrossSymbol from "../../assets/img/symbols/Cross.svg";

const ModalClose: React.FC<any> = ({ onDismiss }) => {
  return (
    <div style={{ position: "absolute", right: "1.5rem", top: "1.5rem" }}>
      <OverlayButton onClick={() => onDismiss()}>
        <img
          alt=""
          src={CrossSymbol}
          style={{ width: ".7rem", height: ".7rem" }}
        />
      </OverlayButton>
    </div>
  );
};

export default ModalClose;
