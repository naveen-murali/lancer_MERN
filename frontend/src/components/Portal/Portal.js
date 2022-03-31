import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const Portal = ({ id = 'portal', children }) => {
    const el = useRef(document.getElementById(id) || document.createElement('div'));
    const [dynamic] = useState(!el.current.parentElement);
    useEffect(() => {
        if (dynamic) {
            el.current.id = id;
            document.body.appendChild(el.current);
        }
        return () => {
            if (dynamic && el.current.parentElement) {
                // eslint-disable-next-line
                el.current.parentElement.removeChild(el.current);
            }
        };
    }, [id, dynamic]);
    return createPortal(children, el.current);
};