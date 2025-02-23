import { useMessage } from "../contexts/MessageContext";

const BmMessage = () => {
  const { message } = useMessage();

  if (!message) {
    return <div></div>; // メッセージがない場合は何も表示しない
  }

  return <div>{message.text}</div>;
};

export default BmMessage;
