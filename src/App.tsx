import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import * as React from 'react';
import '@logseq/libs';
import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user';
import { telegramSendMsg } from './telegram';

export const App = (blockContent: BlockEntity) => {
    const [checkedTelegram, setCheckedTelegram] = React.useState(true);

    const handleChangeTelegram = () => {
        setCheckedTelegram(!checkedTelegram);
    };

    const handleClose = () => {
        logseq.hideMainUI({ restoreEditingCursor: true });
    }

    const handleSend = () => {
        if (checkedTelegram) {
            telegramSendMsg(blockContent);
        }
        logseq.hideMainUI({ restoreEditingCursor: true });
    };

    return (
        <Modal.Dialog>
            <Modal.Header>
                <Modal.Title>Select Platforms to Send</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Checkbox label={"Telegram"} value={checkedTelegram} onChange={handleChangeTelegram}></Checkbox>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSend}>
                    Send
                </Button>
            </Modal.Footer>
        </Modal.Dialog>
    );
}

const Checkbox = ( { label, value, onChange }: { label: string; value: boolean; onChange: () => void }) => {
    return (
        <div className='form-check'>
            <label className='form-check-label' htmlFor={'check' + label}>
                {label}
            </label>
            <input className='form-check-input' type='checkbox' checked={value} onChange={onChange} id={'check' + label} />
        </div>
    );
};
