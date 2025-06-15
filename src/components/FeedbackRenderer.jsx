import React, { Fragment } from 'react';

const FeedbackRenderer = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(Art\.\s*\d+º?)/g);
    return (
        <Fragment>
            {parts.map((part, i) =>
                /(Art\.\s*\d+º?)/.test(part)
                    ? <span key={i} className='legal-mention'>{part}</span>
                    : part
            )}
        </Fragment>
    );
};

export default FeedbackRenderer;