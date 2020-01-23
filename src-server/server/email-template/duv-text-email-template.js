const textEmailTemplate = ({
  title, // compulsory
  greeting,
  firstName,
  contentTop,
  contentBottom,
  buttonText,
  link
}) => {
  let content = '';
  const hello = greeting || 'Hello';
  const heading = `${title.toUpperCase()}`;
  const separator = '-'.repeat(title.length + 3);
  const greetings = firstName ? `${hello} ${firstName}` : hello;
  const button = link
    ? `${buttonText} [${link}] \n\n or copy this url and view in a web browser ${link}`
    : '';
  content += contentTop || '';
  content += contentBottom ? '\n\n' + contentBottom : '';

  // Generate the text format
  // Note: The text is formatted as it should appear on the device
  return `
${heading}
${separator}

${greetings},

${content}

${button}

Thank you,
D.U.V LIVE TEAM.`;
};

export default textEmailTemplate;