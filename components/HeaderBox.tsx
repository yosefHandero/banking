
import { HeaderBoxProps } from "@/types";

const HeaderBox = ({type='title', title, subtext, user}: HeaderBoxProps ) => {
  return (
    <div className="header-box glassy-header">
      <h1 className="header-box-title">
        {type === 'greeting' ? (
          <span className="text-bankGradient">{user}</span>
        ) : (
          title
        )}
      </h1>
      {subtext && <p className="header-box-subtext">{subtext}</p>}
    </div>
  )
}

export default HeaderBox
