import { FC, HTMLAttributes } from 'react';

import styles from './Header.module.css';

type Props = HTMLAttributes<unknown>;

const Header: FC<Props> = ({ ...rest }) => {
  return (
    <header className={styles.header} {...rest}>
      header
    </header>
  );
};

export { Header };
