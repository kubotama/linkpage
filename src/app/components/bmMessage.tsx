import { useMessage } from "../contexts/MessageContext";

const BmMessage = () => {
  const { message } = useMessage();

  if (!message) {
    return <div></div>; // メッセージがない場合は何も表示しない
  }

  return message.text.length > 0 ? (
    <div>
      {message.text}
      <button>確認</button>
    </div>
  ) : (
    <div>linkpage</div>
  );
};

export default BmMessage;
