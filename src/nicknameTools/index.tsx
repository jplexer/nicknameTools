import { ExtensionWebExports } from "@moonlight-mod/types";
import { Message, User } from "discord-types/general";

enum Mode {
  NICK_USER_BRACES = "Nickname (Username)",
  USER_NICK_BRACES = "Username (Nickname)",
  NICK_USER_DASH = "Nickname - Username",
  USER_NICK_DASH = "Username - Nickname",
  NICK = "Just Nickname",
  USER = "Just Username",
}

enum UsernameDisplayname {
  DISPLAY = "Show Display/Nickname",
  USERNAME = "Show Username (lowercase)",
  BOTH = "Show Both",
}

export const styles = [
  `.nnt {
    color: var(--text-muted);
  }`
];

export const patches: ExtensionWebExports["patches"] = [
  {
    find: '?"@":""',
    replace: {
      match: /(?<=0,onClick:\i,onContextMenu:\i,children:).*?\}/,
      replacement: '(require("nicknameTools_replaceNames").default(arguments[0])'
    }
  }
];

export const webpackModules: ExtensionWebExports["webpackModules"] = {
  replaceNames: {
    dependencies: [
      {id: "react"},
    ],
    entrypoint: true,
    run: (module, exports, require) => {
      const React = require("react");
      module.exports.default = ({
        author,
        message,
        isRepliedMessage,
        withMentionPrefix,
        userOverride
      }: {
        author: { nick: string };
        message: Message;
        withMentionPrefix?: boolean;
        isRepliedMessage: boolean;
        userOverride?: User;
      }) => {
        try {
          const user = userOverride ?? message.author;
          const mentionPrefix = withMentionPrefix ? "@" : "";
          const differentColor = 
            moonlight.getConfigOption<boolean>("nicknameTools", "differentColor") 
            ?? true;
          const mode =
            moonlight.getConfigOption<Mode>("nicknameTools", "mode") 
            ?? Mode.NICK_USER_BRACES;
          const prefix = 
            moonlight.getConfigOption<Mode>("nicknameTools", "prefix")
            ?? "";
          const usernameDisplayname =
            moonlight.getConfigOption<UsernameDisplayname>("nicknameTools", "usernameEqualsDisplayname")
            ?? UsernameDisplayname.DISPLAY;
          

          if (isRepliedMessage) {
            return author.nick;
          }

          if (author.nick === user.username) {
            return mentionPrefix + author.nick;
          }

          if (author.nick.toLowerCase() === user.username.toLowerCase()) {
            switch (usernameDisplayname) {
              case UsernameDisplayname.DISPLAY:
                return mentionPrefix + author.nick;
              case UsernameDisplayname.USERNAME:
                return mentionPrefix + user.username;
              case UsernameDisplayname.BOTH:
                break;
            }
          }

          function getFirstPart(mode: Mode) {
            switch (mode) {
              case Mode.NICK:
              case Mode.NICK_USER_BRACES:
              case Mode.NICK_USER_DASH:
                return mentionPrefix + author.nick;
              case Mode.USER:
              case Mode.USER_NICK_BRACES:
              case Mode.USER_NICK_DASH:
                return mentionPrefix + user.username;
            }
          }

          function getSecondPart(mode: Mode) {
            switch (mode) {
              case Mode.NICK_USER_BRACES:
                return " (" + user.username + ")";
              case Mode.USER_NICK_BRACES:
                return " (" + author.nick + ")";
              case Mode.NICK_USER_DASH:
                return " - " + user.username;
              case Mode.USER_NICK_DASH:
                return " - " + author.nick;
              case Mode.NICK:
              case Mode.USER:
                return "";
            }
          }

          if (differentColor) {
            return (
              <>
              {prefix}
              {getFirstPart(mode)}
              <span className="nnt">
                {getSecondPart(mode)}
              </span>
              </>
            );
          }
          
          return (
            <>
            {prefix}
            {getFirstPart(mode)}
            {getSecondPart(mode)}
            </>
          );
          
        } catch (e) {
          return author?.nick;
        }
      }
    }
  },

};
