import { useParams } from "react-router-dom";

function Analytics() {
  const { id } = useParams();

  return <div>Creator Id {id}</div>;
}

export default Analytics;
