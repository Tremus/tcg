import React from 'react';
import styled from 'styled-components';
import { zIndexes } from '../settings';

const ModalVignette = styled.div`
    z-index: ${zIndexes.modalVigntte};
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    position: absolute;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    top: 0;
    left: 0;
`;

const ModalWrap = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
`;

const ModalContent = styled.div`
    z-index: ${zIndexes.ModalContent};
    background-color: white;
    padding: 2rem;
    position: relative;
`;

const ModalCloseButton = styled.button`
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    border: none;
    font-weight: 900;
    padding-bottom: 5px;
    &:focus {
        outline: none;
    }
`;

const handleClose = (e, cb) => {
    const { id } = e.target;
    if (id === 'modal-vignette' || id === 'modal-wrap') {
        cb();
    }
};

const Modal = ({ close, ...props }) => (
    <ModalVignette id="modal-vignette" onClick={e => handleClose(e, close)}>
        <ModalWrap id="modal-wrap">
            <ModalContent>
                <ModalCloseButton onClick={close}>╳</ModalCloseButton>
                <div {...props} />
            </ModalContent>
        </ModalWrap>
    </ModalVignette>
);

export default Modal;
